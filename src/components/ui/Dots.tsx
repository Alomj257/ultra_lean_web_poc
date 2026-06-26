export default function Dots({ active = 0 }: { active?: number }) {
  return (
    <div className="dots">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={i === active ? "active" : ""} />
      ))}
    </div>
  );
}