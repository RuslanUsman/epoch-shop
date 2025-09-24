// src/components/SendPointsForm.jsx
import { useState } from "react"
import { supabase } from "../lib/supabaseClient"

export default function SendPointsForm() {
  const [toUser, setToUser]     = useState("")
  const [amount, setAmount]     = useState("")
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [success, setSuccess]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    const fromUser = supabase.auth.user().id

    const { data, error } = await supabase
      .from("point_transfers")
      .insert([{
        from_user: fromUser,
        to_user:   toUser,
        amount:    parseInt(amount, 10),
      }])

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setToUser("")
      setAmount("")
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
      <h3>Перевести баллы</h3>
      <input
        type="text"
        placeholder="ID получателя"
        value={toUser}
        onChange={e => setToUser(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Сумма"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        required
        min="1"
      />
      <button type="submit" disabled={loading}>
        {loading ? "Отправка..." : "Отправить"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>Перевод выполнен</p>}
    </form>
  )
}
