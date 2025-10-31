const FloralBackground = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      {/* Soft cream gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-indigo-50" />
      {/* Subtle floral-like pattern using radial gradients */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: `
            radial-gradient( circle at 20% 30%, rgba(139,92,246,0.08), transparent 35% ),
            radial-gradient( circle at 80% 20%, rgba(99,102,241,0.10), transparent 40% ),
            radial-gradient( circle at 30% 80%, rgba(147,51,234,0.08), transparent 35% ),
            radial-gradient( circle at 70% 75%, rgba(139,92,246,0.06), transparent 40% )
          `,
          backgroundSize: 'cover'
        }}
      />
    </div>
  );
};

export default FloralBackground;




