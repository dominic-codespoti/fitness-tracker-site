import { getPermalink, getBlogPermalink } from './utils/permalinks';

const links = [
  {
    text: 'Privacy',
    href: getPermalink('privacy', 'page'),
  },
  {
    text: 'Support',
    href: getPermalink('support', 'page'),
  },
  {
    text: 'Blog',
    href: getBlogPermalink(),
  },
  {
    text: 'Discord',
    href: 'https://discord.gg/Rpw8Aza2Kj',
  },
];

export const headerData = {
  links,
  actions: [],
};

export const footerData = {
  links,
  socialLinks: [{ ariaLabel: 'Discord', icon: 'tabler:brand-discord', href: 'https://discord.gg/Rpw8Aza2Kj' }],
  footNote: `Crafted with ❤️ by DJ Applications`,
};
