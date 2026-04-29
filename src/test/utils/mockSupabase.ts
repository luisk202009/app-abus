import { vi } from "vitest";

/**
 * Construye un mock minimalista del cliente Supabase usado en los tests del
 * flujo de Regularización. Cada test puede personalizar las respuestas con
 * `setQueryResponse`, `setAuthResponse`, etc.
 */
export interface MockSupabase {
  client: any;
  // Helpers para configurar respuestas
  setSignUpResponse: (resp: { data?: any; error?: any }) => void;
  setSignInResponse: (resp: { data?: any; error?: any }) => void;
  setGetSessionResponse: (resp: { data?: any; error?: any }) => void;
  setGetUserResponse: (resp: { data?: any; error?: any }) => void;
  setQueryResponse: (table: string, op: string, resp: any) => void;
  // Realtime helpers
  triggerRealtime: (channelName: string, payload: any) => void;
  // Spies
  signUp: ReturnType<typeof vi.fn>;
  signIn: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  removeChannel: ReturnType<typeof vi.fn>;
}

export const createMockSupabase = (): MockSupabase => {
  const queryResponses: Record<string, any> = {};
  const realtimeListeners: Record<string, ((payload: any) => void)[]> = {};

  const signUp = vi.fn().mockResolvedValue({ data: { user: null }, error: null });
  const signIn = vi.fn().mockResolvedValue({ data: { user: null }, error: null });
  const getSession = vi.fn().mockResolvedValue({
    data: { session: { access_token: "fake-token" } },
    error: null,
  });
  const getUser = vi.fn().mockResolvedValue({
    data: { user: { id: "user-123", email: "test@test.com" } },
    error: null,
  });
  const update = vi.fn();
  const insert = vi.fn();
  const removeChannel = vi.fn();

  const buildQuery = (table: string) => {
    const chain: any = {
      _table: table,
      select: vi.fn(() => chain),
      insert: vi.fn((payload: any) => {
        insert(table, payload);
        return chain;
      }),
      update: vi.fn((payload: any) => {
        update(table, payload);
        return chain;
      }),
      delete: vi.fn(() => chain),
      eq: vi.fn(() => chain),
      in: vi.fn(() => chain),
      order: vi.fn(() => chain),
      limit: vi.fn(() => chain),
      single: vi.fn(() => Promise.resolve(queryResponses[`${table}:single`] ?? { data: null, error: null })),
      maybeSingle: vi.fn(() => Promise.resolve(queryResponses[`${table}:maybeSingle`] ?? { data: null, error: null })),
      then: (resolve: any) =>
        Promise.resolve(queryResponses[`${table}:default`] ?? { data: null, error: null }).then(resolve),
    };
    return chain;
  };

  const channel = vi.fn((channelName: string) => {
    const ch: any = {
      _name: channelName,
      on: vi.fn((_event: string, _filter: any, cb: (payload: any) => void) => {
        realtimeListeners[channelName] = realtimeListeners[channelName] || [];
        realtimeListeners[channelName].push(cb);
        return ch;
      }),
      subscribe: vi.fn(() => ch),
    };
    return ch;
  });

  const client = {
    auth: {
      signUp,
      signInWithPassword: signIn,
      getSession,
      getUser,
      signInWithOtp: vi.fn().mockResolvedValue({ data: {}, error: null }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ data: {}, error: null }),
      resend: vi.fn().mockResolvedValue({ data: {}, error: null }),
    },
    from: vi.fn((table: string) => buildQuery(table)),
    channel,
    removeChannel,
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
  };

  return {
    client,
    signUp,
    signIn,
    update,
    insert,
    removeChannel,
    setSignUpResponse: (resp) => signUp.mockResolvedValueOnce(resp),
    setSignInResponse: (resp) => signIn.mockResolvedValueOnce(resp),
    setGetSessionResponse: (resp) => getSession.mockResolvedValueOnce(resp),
    setGetUserResponse: (resp) => getUser.mockResolvedValueOnce(resp),
    setQueryResponse: (table, op, resp) => {
      queryResponses[`${table}:${op}`] = resp;
    },
    triggerRealtime: (channelName, payload) => {
      const listeners = realtimeListeners[channelName] || [];
      listeners.forEach((cb) => cb(payload));
    },
  };
};
