import { useState } from 'react';
import SectionHead from '../components/SectionHead';
import { FREE_SHIPPING_MIN, SHIPPING_FLAT, formatPrice } from '../../shared/shop';

const FAQS = [
  ['How much is shipping?', `Paperback orders over ${formatPrice(FREE_SHIPPING_MIN)} ship free. Below that, shipping is a flat ${formatPrice(SHIPPING_FLAT)}. eBooks never have a shipping charge.`],
  ['How do I get my eBook?', 'Right after payment, go to your Account → My eBook library and press Download. Your eBooks stay there forever, so you can download them again on any device.'],
  ['Which devices can read the eBooks?', 'Our eBooks come as EPUB files, which open on phones, tablets, computers and most e-readers using free reading apps.'],
  ['How long does delivery take?', 'Paperbacks are dispatched within 1–2 business days and usually arrive in 2–7 days depending on where you live.'],
  ['Can I return a book?', 'Paperbacks can be returned within 30 days in their original condition. Because eBooks are delivered instantly, they can only be refunded if the file is faulty.'],
  ['Do I need an account to buy?', 'Yes — a free account keeps your order history in one place and gives you a permanent library for your eBooks.'],
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="section section-tint" id="faq">
      <div className="container narrow">
        <SectionHead eyebrow="Help" title="Frequently asked questions" />

        <div className="faq">
          {FAQS.map(([q, a], i) => (
            <details
              key={q}
              open={openIndex === i}
              onToggle={e => {
                if (e.currentTarget.open) setOpenIndex(i);
                else if (openIndex === i) setOpenIndex(null);
              }}
            >
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
