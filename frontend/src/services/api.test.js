describe("api service fallback behavior", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    global.fetch = originalFetch;
  });

  test("uses primary /api endpoint when request succeeds", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ test_cases: [], edge_cases: [], checklist: [] }),
    });

    const { generateTestArtifacts } = await import("./api");
    await generateTestArtifacts("User can login");

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/generate",
      expect.objectContaining({ method: "POST" })
    );
  });

  test("retries without /api when primary returns 405", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 405,
        json: async () => ({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ test_cases: [], edge_cases: [], checklist: [] }),
      });

    const { generateTestArtifacts } = await import("./api");
    await generateTestArtifacts("User can login");

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      "/api/generate",
      expect.objectContaining({ method: "POST" })
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      "/generate",
      expect.objectContaining({ method: "POST" })
    );
  });

  test("does not retry on non-404/405 errors", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    const { generateTestArtifacts } = await import("./api");

    await expect(generateTestArtifacts("User can login")).rejects.toThrow(
      "Server error: 500"
    );
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test("includes retry context when fallback attempt also fails", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({}),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      });

    const { generateTestArtifacts } = await import("./api");

    await expect(generateTestArtifacts("User can login")).rejects.toThrow(
      "Server error: 500 (after retry without /api)"
    );
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  test("throws clear error when fallback request itself throws", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 405,
        json: async () => ({}),
      })
      .mockRejectedValueOnce(new Error("Network down"));

    const { generateTestArtifacts } = await import("./api");

    await expect(generateTestArtifacts("User can login")).rejects.toThrow(
      "Fallback request failed after /api retry trigger: Network down"
    );
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
