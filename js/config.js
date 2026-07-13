export const shopifyConfig = {
  domain: 'gzirvy-uj.myshopify.com',
  storefrontAccessToken: 'dc19323c884622f741be640fa1d42c01',
  apiVersion: '2024-01',
  get endpoint() {
    return `https://${this.domain}/api/${this.apiVersion}/graphql.json`;
  }
};
