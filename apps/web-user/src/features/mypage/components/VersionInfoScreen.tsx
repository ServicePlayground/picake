const APP_VERSION = "0.0.1";

interface VersionInfoRowProps {
  label: string;
  value: string;
}

function VersionInfoRow({ label, value }: VersionInfoRowProps) {
  return (
    <div className="px-5 py-4 border-b border-gray-100">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-bold text-gray-900 shrink-0">{label}</span>
        <span className="text-sm text-gray-700 text-right break-all font-mono">{value}</span>
      </div>
    </div>
  );
}

function formatBuildNumber(commitSha: string | undefined): string {
  const sha = commitSha?.trim();
  if (!sha) return "—";
  return sha.slice(0, 7);
}

export function VersionInfoScreen() {
  const buildNumber = formatBuildNumber(process.env.NEXT_PUBLIC_GITHUB_SHA);

  return (
    <div className="pt-4 pb-10">
      <VersionInfoRow label="앱 버전" value={APP_VERSION} />
      <VersionInfoRow label="웹 버전" value={buildNumber} />
    </div>
  );
}
