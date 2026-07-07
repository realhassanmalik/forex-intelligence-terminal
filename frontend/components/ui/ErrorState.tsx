export function ErrorState({ message }: { message: string }) {
  return (
    <div className="hud-panel hud-corners rounded-lg border-danger/40 p-5 font-mono text-sm text-danger">
      <p className="font-semibold uppercase tracking-widest">
        <span className="animate-flicker">⚠</span> Connection lost // backend unreachable
      </p>
      <p className="mt-2 text-danger/80">{message}</p>
      <p className="mt-3 text-xs text-danger/60">
        Ensure the FastAPI server is running (uvicorn app.main:app --reload) and NEXT_PUBLIC_API_BASE_URL points to it.
      </p>
    </div>
  );
}
