-- Insert HU36 Lishi Tool for Mercedes-Benz
INSERT INTO hub_lishi_tools (
  tool_name, 
  tool_code, 
  brand, 
  compatibility, 
  years, 
  notes, 
  profile, 
  image_path
)
VALUES (
  'Original Lishi 2-in-1 Pick and Decoder HU36',
  'HU36',
  'Mercedes-Benz',
  '["230", "240D", "280CE", "280E", "300D", "450SL"]'::jsonb,
  '1973-1985',
  'Depths: 1-4, Tool Spaces: 1-10, Material: Stainless Steel or Anti-Glare Stainless Steel',
  'HU36 / MB1 / M2',
  'mercedes-benz-hu36'
);
