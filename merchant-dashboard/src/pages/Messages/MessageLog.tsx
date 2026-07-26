import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { listMessages } from "../../lib/apiClient";
import { DataTable } from "../../components/DataTable";

export default function MessageLog() {
  const { t } = useTranslation();
  const { data } = useQuery({ queryKey: ["messages"], queryFn: listMessages });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-primary">{t("messages.title")}</h1>
        <p className="mt-1 text-sm text-mutedForeground">{t("messages.subtitle")}</p>
      </div>

      <DataTable
        rows={data ?? []}
        keyField={(m) => m.id}
        emptyMessage={t("common.noResults")}
        columns={[
          { header: t("messages.to"), render: (m) => m.toPhone },
          { header: t("campaigns.channel"), render: (m) => m.channel },
          { header: t("messages.purpose"), render: (m) => m.purpose },
          { header: t("common.name"), render: (m) => <span className="line-clamp-2 max-w-xs text-sm text-mutedForeground">{m.body}</span> },
          { header: t("common.status"), render: (m) => m.status },
          { header: t("messages.sentAt"), render: (m) => new Date(m.createdAt).toLocaleString() },
        ]}
      />
    </div>
  );
}
