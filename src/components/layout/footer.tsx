import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[var(--text-primary)] text-white/70">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-blue)] flex items-center justify-center">
                <span className="text-white font-bold text-sm">TH</span>
              </div>
              <span className="text-xl font-bold text-white font-heading">ToyHype</span>
            </div>
            <p className="text-sm leading-relaxed">
              Cool toys for the kid in you. RC helicopters, gadgets, puzzles & more.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="hover:text-white transition-colors">All Toys</Link></li>
              <li><Link href="/category/rc-vehicles" className="hover:text-white transition-colors">RC Vehicles</Link></li>
              <li><Link href="/category/tech-toys" className="hover:text-white transition-colors">Tech Toys</Link></li>
              <li><Link href="/category/board-games" className="hover:text-white transition-colors">Board Games</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/category/desk-gadgets" className="hover:text-white transition-colors">Desk Gadgets</Link></li>
              <li><Link href="/category/fidget-gear" className="hover:text-white transition-colors">Fidget Gear</Link></li>
              <li><Link href="/category/puzzles" className="hover:text-white transition-colors">Puzzles</Link></li>
              <li><Link href="/category/collectibles" className="hover:text-white transition-colors">Collectibles</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Help</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/track" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link href="/returns" className="hover:text-white transition-colors">Return & Refund Policy</Link></li>
              <li><a href="mailto:dhandhaonground@gmail.com" className="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>

        {/* Payment badges */}
        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 text-white/40 text-xs font-medium">
            <span className="px-2 py-1 border border-white/20 rounded">UPI</span>
            <span className="px-2 py-1 border border-white/20 rounded">VISA</span>
            <span className="px-2 py-1 border border-white/20 rounded">Mastercard</span>
            <span className="px-2 py-1 border border-white/20 rounded">RuPay</span>
            <span className="px-2 py-1 border border-white/20 rounded">Net Banking</span>
            <span className="px-2 py-1 border border-white/20 rounded bg-green-900/30 text-green-400">COD</span>
          </div>
          <p className="text-xs text-white/40">&copy; {new Date().getFullYear()} ToyHype. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
