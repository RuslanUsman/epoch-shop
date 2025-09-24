// src/components/SendPointsForm.jsx
import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function SendPointsForm({ targetUserId }) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const handleTransfer = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const fromUser = supabase.auth.user().id

    const { data, error } = await supabase
      .from('point_transfers')
      .insert([{
        from_user: fromUser,
        to_user:   targetUserId,
        amount:    parseInt(amount, 10),
      }])

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      alert('Перевод выполнен успешно!')
      setAmount('')
    }
  }

  return (
    <form onSubmit={handleTransfer}>
      <input
        type="number"
        placeholder="Сколько баллов отправить"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Отправка...' : 'Отправить баллы'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  )
}
