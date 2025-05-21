// Este objeto sirve para utilizarlo en mis servicios, en vez de llamar directamente al process.env
export const EnvConfiguration = () => ({
  envType: process.env.ENV_TYPE || 'DEV',
  paginationLimit: 5,
  secret: process.env.SECRET,
});
