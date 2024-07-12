import app from './app';
import config from 'config';

const PORT = process.env.PORT || config.get('app.port');

app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
