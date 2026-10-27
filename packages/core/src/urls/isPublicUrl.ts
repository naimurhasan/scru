const PRIVATE_HOSTNAMES = /^(localhost|.*\.local|.*\.internal|.*\.localhost)$/i;

const PRIVATE_IPV4 = [
  /^0\./,
  /^10\./,
  /^127\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,
];

const isPrivateIpv6 = (hostname: string) =>
  hostname.startsWith("[") &&
  /^\[(::1?|f[cd][0-9a-f]{2}:.*|fe[89ab][0-9a-f]:.*|::ffff:.*)\]$/i.test(
    hostname,
  );

export const isHttpUrl = (value: string): boolean =>
  URL.canParse(value) && /^https?:$/.test(new URL(value).protocol);

export const isPublicUrl = (value: string): boolean => {
  if (!isHttpUrl(value)) return false;
  const { hostname } = new URL(value);
  return (
    !PRIVATE_HOSTNAMES.test(hostname) &&
    !PRIVATE_IPV4.some((range) => range.test(hostname)) &&
    !isPrivateIpv6(hostname)
  );
};
