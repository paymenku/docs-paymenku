import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <img
            src="/logo.png"
            alt="Paymenku Docs"
            width={95}
            height={32}
            className="h-8 w-auto dark:hidden"
          />
          <img
            src="/logo-dark.png"
            alt="Paymenku Docs"
            width={95}
            height={32}
            className="hidden h-8 w-auto dark:block"
          />
        </>
      ),
    },
    links: [
      { text: 'Dokumentasi', url: '/docs' },
      { text: 'Dashboard', url: 'https://paymenku.com/merchant' },
    ],
  };
}
