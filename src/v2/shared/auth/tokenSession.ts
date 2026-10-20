export type TokenSession = {
  clear(): Promise<void>;
};

let activeTokenSession: TokenSession | undefined;

export function configureTokenSession(session: TokenSession): () => void {
  activeTokenSession = session;

  return () => {
    if (activeTokenSession === session) {
      activeTokenSession = undefined;
    }
  };
}

export async function clearTokenSession(): Promise<void> {
  if (!activeTokenSession) {
    throw new Error('V2 token session has not been configured.');
  }

  await activeTokenSession.clear();
}
