const FloralBackground = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      {/* Soft cream gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFF4E5] via-white to-[#FFF4E5]" />
      {/* Subtle floral-like pattern using radial gradients */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: `
            radial-gradient( circle at 20% 30%, rgba(255,122,0,0.08), transparent 35% ),
            radial-gradient( circle at 80% 20%, rgba(255,169,77,0.10), transparent 40% ),
            radial-gradient( circle at 30% 80%, rgba(255,160,122,0.08), transparent 35% ),
            radial-gradient( circle at 70% 75%, rgba(255,122,0,0.06), transparent 40% )
          `,
          backgroundSize: 'cover'
        }}
      />
    </div>
  );
};

export default FloralBackground;



