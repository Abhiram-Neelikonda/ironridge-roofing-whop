/** Small row of payment/financing marks shown under pricing.
 *  Text marks (not official logos) — the brand guide warns against implying a
 *  provider is guaranteed. Whop surfaces the real, eligible methods at checkout. */
import { site } from "../../config/site";

export function PaymentMethods() {
  return (
    <div className="plans__methods" aria-label="Accepted payment and financing options">
      {site.financing.providers.map((p) => (
        <span className="mark" key={p}>
          {p}
        </span>
      ))}
    </div>
  );
}
