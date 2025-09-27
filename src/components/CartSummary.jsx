import React, { useEffect, useState } from "react"
import { calculateTotal } from "../utils/calculateTotal"
import { supabase } from "../lib/supabase"

export default function CartSummary({ cartItems }) {
  const [isVip, setIsVip] = useState(false)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    async function fetchVipStatus() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_vip")
          .eq("id", user.id)
          .single()

        setIsVip(profile?.is_vip || false)
      }
    }

    fetchVipStatus()
  }, [])

  useEffect(() => {
    const totalPrice = calculateTotal(cartItems, isVip)
    setTotal(totalPrice)
  }, [cartItems, isVip])

  return (
    <div className="cart-summary">
      <h2>Итог: {total.toFixed(2)} ₽</h2>
      {isVip && <p className="vip-discount">🎉 Применена VIP-скидка 10%</p>}
    </div>
  )
}
