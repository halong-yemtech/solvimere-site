import { NextResponse } from "next/server";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

const { GA_CLIENT_EMAIL, GA_PRIVATE_KEY, GA_PROPERTY_ID } = process.env;

// Created only when credentials are present, so the route never crashes on import.
const analyticsDataClient =
  GA_CLIENT_EMAIL && GA_PRIVATE_KEY && GA_PROPERTY_ID
    ? new BetaAnalyticsDataClient({
        credentials: {
          client_email: GA_CLIENT_EMAIL,
          // .env files store the key with literal "\n" sequences
          private_key: GA_PRIVATE_KEY.replace(/\\n/g, "\n"),
        },
      })
    : null;

export async function GET() {
  if (!analyticsDataClient) {
    // Analytics not configured: null tells the UI to hide the page-view card.
    return NextResponse.json(null);
  }

  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${GA_PROPERTY_ID}`,
      dateRanges: [
        {
          startDate: `30daysAgo`,
          endDate: "today",
        },
      ],
      dimensions: [{ name: "year" }],
      metrics: [{ name: "activeUsers" }],
    });

    let totalVisitors = 0;
    response.rows?.forEach((row: any) => {
      totalVisitors += parseInt(row.metricValues[0].value);
    });

    return NextResponse.json(totalVisitors);
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
