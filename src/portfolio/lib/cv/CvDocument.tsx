import { Document, Font, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { CvData, CvEntry } from "./data";

// Liberation Serif: metric-compatible with Times New Roman (the template's font),
// with full Latin coverage incl. Vietnamese. SIL OFL 1.1 — see public/fonts/cv/LICENSE.txt.
// Served by the site from public/fonts/cv.
const fontDir = "/fonts/cv";
Font.register({
  family: "CvSerif",
  fonts: [
    { src: `${fontDir}/LiberationSerif-Regular.ttf` },
    { src: `${fontDir}/LiberationSerif-Bold.ttf`, fontWeight: "bold" },
    { src: `${fontDir}/LiberationSerif-Italic.ttf`, fontStyle: "italic" },
    { src: `${fontDir}/LiberationSerif-BoldItalic.ttf`, fontWeight: "bold", fontStyle: "italic" },
  ],
});
// Never hyphenate words across lines (react-pdf does by default).
Font.registerHyphenationCallback((word) => [word]);

const s = StyleSheet.create({
  page: {
    fontFamily: "CvSerif",
    fontSize: 10,
    lineHeight: 1.25,
    color: "#000",
    paddingTop: 32,
    paddingBottom: 36,
    paddingHorizontal: 40,
  },
  name: { fontSize: 27, textAlign: "center", lineHeight: 1.1 },
  headline: { fontSize: 9.5, textAlign: "center", marginTop: 2 },
  contact: { fontSize: 9.5, textAlign: "center", marginTop: 1 },
  link: { color: "#000", textDecoration: "underline" },
  section: { marginTop: 9 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    borderBottomWidth: 0.6,
    borderBottomColor: "#777",
    paddingBottom: 1,
    marginBottom: 4,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  org: { fontWeight: "bold" },
  period: { fontWeight: "bold" },
  italic: { fontStyle: "italic" },
  entry: { marginBottom: 4 },
  bullet: { flexDirection: "row", paddingLeft: 2 },
  dot: { width: 8 },
  bulletText: { flex: 1 },
});

function Bullet({ children }: { children: string }) {
  return (
    <View style={s.bullet} wrap={false}>
      <Text style={s.dot}>•</Text>
      <Text style={s.bulletText}>{children}</Text>
    </View>
  );
}

function Entry({ e }: { e: CvEntry }) {
  return (
    <View style={s.entry}>
      {/* Keep the heading lines together with the first bullet. */}
      <View wrap={false}>
        <View style={s.row}>
          <Text style={s.org}>{e.org}</Text>
          <Text style={s.period}>{e.period}</Text>
        </View>
        {(e.role || e.location) && (
          <View style={s.row}>
            <Text style={s.italic}>{e.role}</Text>
            <Text style={s.italic}>{e.location}</Text>
          </View>
        )}
        {e.bullets[0] && <Bullet>{e.bullets[0]}</Bullet>}
      </View>
      {e.bullets.slice(1).map((b, i) => (
        <Bullet key={i}>{b}</Bullet>
      ))}
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle} minPresenceAhead={40}>
        {title}
      </Text>
      {children}
    </View>
  );
}

/** One-page-style résumé matching the uploaded template's layout. */
export default function CvDocument({ data }: { data: CvData }) {
  const contact = [...data.contact];
  return (
    <Document
      title={`${data.name} — CV`}
      author={data.name}
      subject="Curriculum vitae"
      creator="Portfolio CMS"
      producer="Portfolio CMS"
    >
      <Page size="LETTER" style={s.page}>
        <Text style={s.name}>{data.name}</Text>
        {data.headline && <Text style={s.headline}>{data.headline}</Text>}
        {(contact.length > 0 || data.email) && (
          <Text style={s.contact}>
            {contact.join("  |  ")}
            {contact.length > 0 && data.email ? "  |  " : ""}
            {data.email && (
              <Link src={`mailto:${data.email}`} style={s.link}>
                {data.email}
              </Link>
            )}
          </Text>
        )}

        {data.summary && (
          <Section title="Profile">
            <Text>{data.summary}</Text>
          </Section>
        )}

        {data.experience.length > 0 && (
          <Section title="Professional Experience">
            {data.experience.map((e, i) => (
              <Entry key={i} e={e} />
            ))}
          </Section>
        )}

        {data.skills.length > 0 && (
          <Section title="Skills">
            <Bullet>{data.skills.join(", ")}</Bullet>
          </Section>
        )}

        {data.education.length > 0 && (
          <Section title="Education">
            {data.education.map((e, i) => (
              <Entry key={i} e={e} />
            ))}
          </Section>
        )}
      </Page>
    </Document>
  );
}
