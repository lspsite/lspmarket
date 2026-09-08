exports.create = async (supabase, { label, url, category }) => {
  const { data, error } = await supabase.from('buttons').insert({ label, url, category }).select().single();
  return { data, error };
};

exports.list = async (supabase, { category } = {}) => {
  let query = supabase.from('buttons').select('*').order('position');
  if (category) query = query.eq('category', category);
  const { data, error } = await query;
  return { data, error };
};

exports.update = async (supabase, id, { label, url }) => {
  const { data, error } = await supabase.from('buttons').update({ label, url }).eq('id', id).select().single();
  return { data, error };
};

exports.remove = async (supabase, id) => {
  const { data, error } = await supabase.from('buttons').delete().eq('id', id).select().single();
  return { data, error };
};