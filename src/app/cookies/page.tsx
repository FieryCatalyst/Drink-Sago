import LegalPage from "@/components/legal-page";

export default function CookiesPage() {
  return <LegalPage title="Cookie Policy" intro="This policy describes the small amount of browser storage used by sago.world and how optional analytics is controlled." sections={[
    { title: "Necessary browser storage", children: <><p>The age gate uses local browser storage named <code>sago-age-verified</code> after you confirm that you meet the legal drinking age where you live. This is necessary for the site’s age-control experience and is not used for advertising.</p></> },
    { title: "Optional analytics", children: <><p>Vercel Analytics is not loaded until you select “Allow analytics” in the consent banner. Your choice is remembered in local browser storage named <code>sago-analytics-consent</code>. Select “Reject analytics” to prevent the analytics component from loading. The current site does not use advertising cookies, social pixels, session replay or third-party embeds.</p></> },
    { title: "Managing storage", children: <><p>You can remove these values through your browser’s site-data controls. Removing them may show the age gate and consent banner again. Browser controls can also block storage, but some site functions may then be less convenient.</p></> },
    { title: "Changes", children: <><p>We will update this page when storage, analytics or embedded services change. Any new non-essential technology should be added behind consent and reflected here before release.</p></> },
  ]} />;
}
