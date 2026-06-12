"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getSchemaByTemplateId, getSettingsByTemplateId } from "../presentation-templates";

const page = () => {
  const searchParams = useSearchParams();
  const templateID = searchParams.get("group");
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({
    description: "",
    ordered: false,
    default: false,
    icon_weight: "bold",
  });

  useEffect(() => {
    if (!templateID) return;
    setLayout(getSchemaByTemplateId(templateID));
    setSettings(
      getSettingsByTemplateId(templateID) || {
        description: "",
        ordered: false,
        default: true,
        icon_weight: "bold",
      }
    );
    setLoading(false);
  }, [templateID]);

  if (!templateID) {
    return <div>No templateID provided</div>;
  }

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <div data-layouts={JSON.stringify(layout)}>
            <pre>{JSON.stringify(layout, null, 2)}</pre>
          </div>
          <div data-settings={JSON.stringify(settings)}>
            <pre>{JSON.stringify(settings, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default page;
