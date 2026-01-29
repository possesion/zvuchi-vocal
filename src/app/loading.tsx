export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center primary-bg">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold">Загрузка...</h2>
        <p className="text-gray-300 mt-2">ЗВУЧИ - Вокальная студия</p>
      </div>
    </div>
  )
}