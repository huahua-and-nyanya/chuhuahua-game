import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { PAGE_BGS } from '@/assets';
import { getCurrentSeason } from '@/lib/season';

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const bg = PAGE_BGS[getCurrentSeason()];
  return (
    <>
      <div className="page-bg" style={{ backgroundImage: `url(${bg})` }}>
        <Outlet />
      </div>
      {import.meta.env.DEV && (
        <TanStackRouterDevtools position="bottom-right" />
      )}
    </>
  );
}
