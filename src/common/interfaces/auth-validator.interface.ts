export interface AuthenticatedUser {
  userId: string;
  username: string;
}

export interface IAuthValidator {
  /**
   * Validates raw credentials and returns the authenticated user.
   *
   * Args:
   *   credentials: Arbitrary credentials extracted from the request
   *     (e.g. an Authorization header, JWT, basic auth string, etc.).
   *
   * Returns:
   *   The authenticated user when credentials are valid, or null when
   *   they cannot be resolved to a user.
   */
  validate(credentials: unknown): Promise<AuthenticatedUser | null>;
}
