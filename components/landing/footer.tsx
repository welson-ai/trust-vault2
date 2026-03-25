import Link from "next/link"

export function LandingFooter() {
  return (
    <footer className="w-full bg-muted/5 border-t border-accent/20">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 mb-4 sm:mb-6">
          <div>
            <h4 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3">Trust Vault</h4>
            <p className="text-xs text-muted-foreground leading-tight">
              Secure payments and trust scores for financial freedom.
            </p>
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3">Product</h4>
            <ul className="space-y-1 text-xs">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition">
                  Security
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3">Company</h4>
            <ul className="space-y-1 text-xs">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3">Legal</h4>
            <ul className="space-y-1 text-xs">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition">
                  Security
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-4 sm:pt-6 border-t border-accent/20">
          <p className="text-xs text-muted-foreground text-center">© 2025 Trust Vault. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
