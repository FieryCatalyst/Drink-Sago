import LegalPage from "@/components/legal-page";

export default function RefundsPage() {
  return <LegalPage title="Refund Policy" intro="Sago does not currently sell bottles, tickets or other goods through this website, so there is no online checkout or direct refund process here." sections={[
    { title: "Purchases from retailers", children: <><p>If you buy Sago from a shop, bar, restaurant, hotel or other retailer, that seller is responsible for the transaction, receipt, returns, exchanges and refunds. Contact the seller first and keep your proof of purchase.</p></> },
    { title: "Damaged or incorrect products", children: <><p>Contact the retailer promptly about damaged, missing or incorrect goods. You can also email <a href="mailto:Info@drinksago.com">Info@drinksago.com</a> with the retailer name, purchase date and a description. Do not send payment details or unnecessary personal information.</p></> },
    { title: "Future online sales", children: <><p>If Sago later adds online sales, the checkout will display separate purchase, delivery, cancellation and refund terms before payment. Those terms will be updated for applicable consumer and alcohol laws in each delivery location.</p></> },
  ]} />;
}
