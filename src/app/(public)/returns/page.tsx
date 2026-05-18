import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Mail, Clock, Package, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Return & Refund Policy",
};

export default function ReturnsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <h1 className="text-3xl md:text-4xl font-extrabold font-heading tracking-tight mb-8">
            Return & Refund Policy
          </h1>

          <div className="space-y-8 text-[var(--text-secondary)] leading-relaxed">
            <section className="bg-blue-50 rounded-2xl p-6 flex gap-4">
              <Clock className="w-6 h-6 text-[var(--accent-blue)] shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">7-Day Return Window</h2>
                <p>You can request a return within <strong>7 days</strong> of receiving your order. After 7 days, we are unable to process returns or refunds.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">How to Request a Return</h2>
              <ol className="list-decimal list-inside space-y-3 ml-1">
                <li>Email us at <a href="mailto:dhandhaonground@gmail.com" className="text-[var(--accent-blue)] font-semibold hover:underline">dhandhaonground@gmail.com</a> within 7 days of delivery.</li>
                <li>Include your <strong>order number</strong> and <strong>reason for return</strong> in the email.</li>
                <li>We will reply within 24-48 hours with return instructions.</li>
                <li>Ship the item back in its original packaging.</li>
                <li>Once we receive and inspect the item, your refund will be processed within 5-7 business days.</li>
              </ol>
            </section>

            <section className="bg-orange-50 rounded-2xl p-6 flex gap-4">
              <AlertCircle className="w-6 h-6 text-[var(--accent-orange)] shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">Conditions for Return</h2>
                <ul className="list-disc list-inside space-y-1.5 mt-2">
                  <li>Item must be unused and in original packaging</li>
                  <li>Item must not be damaged by the customer</li>
                  <li>Return shipping cost is borne by the customer</li>
                  <li>Opened electronics/gadgets can only be returned if defective</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">Refund Process</h2>
              <p>Refunds are processed to the original payment method (UPI, card, or net banking). You will receive the refund within 5-7 business days after we receive the returned item.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">Damaged or Defective Items</h2>
              <p>If you receive a damaged or defective product, email us immediately with photos of the damage. We will arrange a free replacement or full refund — no questions asked.</p>
            </section>

            <section className="bg-[var(--bg-warm)] rounded-2xl p-6 flex gap-4">
              <Mail className="w-6 h-6 text-[var(--accent-blue)] shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">Contact Us</h2>
                <p>For any questions about returns, refunds, or your order:</p>
                <p className="mt-2">
                  <a href="mailto:dhandhaonground@gmail.com" className="text-[var(--accent-blue)] font-bold hover:underline text-lg">
                    dhandhaonground@gmail.com
                  </a>
                </p>
                <p className="text-sm text-[var(--text-muted)] mt-1">We typically respond within 24 hours.</p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
