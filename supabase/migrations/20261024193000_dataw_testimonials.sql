update public.pages
set content = jsonb_set(content, '{testimonials}', $json$[
  {
    "quote": "As a lean AI team we cannot afford bad data or payment disputes. Escrow on Data-W holds funds until I approve deliverables, and validation agents catch issues before they ever hit our training pipeline.",
    "name": "Jesse Schenk",
    "role": "Co-founder & CEO, Showfer Media LLC",
    "avatar": "/images/clients/jesse-schenk.png",
    "photo": "/images/clients/customer-stories.jpg"
  },
  {
    "quote": "We spent months chasing niche street-scene imagery for our perception stack. On Data-W we posted the spec once, matched with collectors in days, and had agent-validated batches in our pipeline before our next sprint review.",
    "name": "Ari X",
    "role": "Founder, CEO, Beejern",
    "avatar": "/images/clients/ari-x.png",
    "photo": "/images/clients/customer-stories.jpg"
  },
  {
    "quote": "Crowdsourcing through forums gave us inconsistent labels and almost no provenance. Data-W gave us structured submissions, clear consent, and enough volume to train our model without delaying the dissertation timeline.",
    "name": "Tracy West",
    "role": "EVP of Digital Content, Freecast",
    "avatar": "/images/clients/tracy-west.webp",
    "photo": "/images/clients/customer-stories.jpg"
  },
  {
    "quote": "Freelance platforms rarely reward specialty work. On Data-W, repeat requesters book me for consistent capture standards, and agent validation means fewer disputes and more predictable income month to month.",
    "name": "Joe Simonds",
    "role": "CEO, Saltstrong",
    "avatar": "/images/clients/joe-simonds.png",
    "photo": "/images/clients/customer-stories.jpg"
  }
]$json$::jsonb)
where slug = 'home'
  and (content->'testimonials') @> '[{"name":"Maria Chen"},{"name":"Priya Nair"}]'::jsonb;
