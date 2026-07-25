function publicSsoPath(
  action: "end" | "refresh" | "start",
  returnTo: string,
): string {
  return `/sso/${action}?${new URLSearchParams({ returnTo })}`;
}

export function leafLoginPath(returnTo = "/"): string {
  return publicSsoPath("start", returnTo);
}

export function leafLogoutPath(returnTo = "/"): string {
  return publicSsoPath("end", returnTo);
}

export function leafRefreshPath(returnTo = "/"): string {
  return publicSsoPath("refresh", returnTo);
}
