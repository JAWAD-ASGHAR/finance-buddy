type JsonLdValue = Record<string, unknown>;

type JsonLdProps = {
  data: JsonLdValue | readonly JsonLdValue[];
};

function serializeJsonLd(data: JsonLdValue) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function JsonLd({ data }: JsonLdProps) {
  const entries = Array.isArray(data) ? data : [data];

  return (
    <>
      {entries.map((entry, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(entry) }}
        />
      ))}
    </>
  );
}
