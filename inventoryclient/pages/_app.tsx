import React from 'react';
import { SWRConfig } from 'swr';
import '../styles/globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Layout from '../components/Layout';

export default function App({ Component, pageProps }) {
  return (
    
    <SWRConfig value = {{ fetcher: (...args) => fetch(...args).then((res) => res.json()) }}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SWRConfig>
  )
}
