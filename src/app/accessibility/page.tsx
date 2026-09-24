import LegalPage from "@/components/legal-page";

export default function AccessibilityPage() {
  return <LegalPage title="Accessibility" intro="We want sago.world to be usable by as many people as possible, including people who use keyboards, screen readers, magnification or reduced motion." sections={[
    { title: "Current approach", children: <><p>The site uses semantic headings, labelled controls, text alternatives for meaningful images, visible keyboard focus, responsive layouts and reduced-motion preferences. The age gate and analytics banner can be operated from the keyboard.</p></> },
    { title: "Known limitations", children: <><p>Some animated visual sections and the decorative market map may not provide a complete equivalent experience in every assistive technology. Retailer locations and availability should be available as text, not only as visual map markers. We are continuing to improve these areas.</p></> },
    { title: "Feedback", children: <><p>Tell us what blocked you, which page you were using and what assistive technology or browser you used. Contact <a href="mailto:Info@drinksago.com">Info@drinksago.com</a> and we will consider the issue for improvement.</p></> },
  ]} />;
}
