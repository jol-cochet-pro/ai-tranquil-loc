export function CitySkyline() {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-48 pointer-events-none z-0">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
      <img
        src="/svg/building.svg"
        alt=""
        className="w-full h-full object-cover object-bottom opacity-30"
        aria-hidden="true"
      />
    </div>
  )
}
