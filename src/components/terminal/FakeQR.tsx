export default function FakeQR({ small = false }: { small?: boolean }) {
  return (
    <div className={small ? "qr small" : "qr"} aria-label="fake qr">
      {Array.from({ length: 64 }).map((_, i) => (
        <i
          key={i}
          className={
            (i * 7 + i) % 3 === 0 ||
            [0, 1, 8, 9, 6, 7, 14, 15, 48, 49, 56, 57].includes(i)
              ? "on"
              : ""
          }
        />
      ))}
    </div>
  );
}