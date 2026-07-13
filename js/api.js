import { shopifyConfig } from './config.js';

async function shopifyQuery(query, variables = {}) {
  try {
    const response = await fetch(shopifyConfig.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': shopifyConfig.storefrontAccessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    const json = await response.json();
    if (json.errors) {
      console.error('Shopify API Errors:', json.errors);
      throw new Error(json.errors.map(e => e.message).join(', '));
    }
    return json.data;
  } catch (error) {
    console.error('Shopify Fetch Error:', error);
    throw error;
  }
}

// 1. Fetch collections for home page / navigation
export async function fetchCollections(limit = 6) {
  const query = `
    query getCollections($first: Int!) {
      collections(first: $first) {
        edges {
          node {
            id
            title
            handle
            description
            image {
              url
              altText
            }
          }
        }
      }
    }
  `;
  const data = await shopifyQuery(query, { first: limit });
  return data.collections.edges.map(edge => edge.node);
}

// 2. Fetch products in a collection
export async function fetchCollectionProducts(handle, limit = 12) {
  const query = `
    query getCollectionByHandle($handle: String!, $first: Int!) {
      collection(handle: $handle) {
        id
        title
        description
        image {
          url
          altText
        }
        products(first: $first) {
          edges {
            node {
              id
              title
              handle
              vendor
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
  const data = await shopifyQuery(query, { handle, first: limit });
  if (!data.collection) return null;
  return {
    ...data.collection,
    products: data.collection.products.edges.map(edge => edge.node),
  };
}

// 3. Fetch single product details
export async function fetchProductByHandle(handle) {
  const query = `
    query getProductByHandle($handle: String!) {
      product(handle: $handle) {
        id
        title
        handle
        description
        descriptionHtml
        vendor
        productType
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 5) {
          edges {
            node {
              url
              altText
            }
          }
        }
        options {
          name
          values
        }
        variants(first: 20) {
          edges {
            node {
              id
              title
              availableForSale
              price {
                amount
                currencyCode
              }
              image {
                url
                altText
              }
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
  `;
  const data = await shopifyQuery(query, { handle });
  if (!data.product) return null;
  
  return {
    ...data.product,
    images: data.product.images.edges.map(edge => edge.node),
    variants: data.product.variants.edges.map(edge => edge.node),
  };
}

// 4. Search products
export async function searchProducts(searchTerm, limit = 12) {
  const query = `
    query searchProducts($query: String!, $first: Int!) {
      products(first: $first, query: $query) {
        edges {
          node {
            id
            title
            handle
            vendor
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      }
    }
  `;
  const data = await shopifyQuery(query, { query: searchTerm, first: limit });
  return data.products.edges.map(edge => edge.node);
}

// Helper to format cart data
function formatCart(cart) {
  if (!cart) return null;
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    subtotal: cart.cost.subtotalAmount,
    total: cart.cost.totalAmount,
    lines: cart.lines.edges.map(edge => ({
      id: edge.node.id,
      quantity: edge.node.quantity,
      variant: edge.node.merchandise,
    })),
  };
}

// Cart details query fragment
const cartFields = `
  id
  checkoutUrl
  lines(first: 100) {
    edges {
      node {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            price {
              amount
              currencyCode
            }
            image {
              url
            }
            product {
              title
              handle
            }
          }
        }
      }
    }
  }
  cost {
    totalAmount {
      amount
      currencyCode
    }
    subtotalAmount {
      amount
      currencyCode
    }
  }
`;

// 5. Create Cart
export async function createCart(variantId, quantity = 1) {
  const mutation = `
    mutation cartCreate($input: CartInput) {
      cartCreate(input: $input) {
        cart {
          ${cartFields}
        }
      }
    }
  `;
  const variables = {
    input: {
      lines: [{ merchandiseId: variantId, quantity }]
    }
  };
  const data = await shopifyQuery(mutation, variables);
  return formatCart(data.cartCreate.cart);
}

// 6. Fetch Existing Cart
export async function fetchCart(cartId) {
  const query = `
    query getCart($id: ID!) {
      cart(id: $id) {
        ${cartFields}
      }
    }
  `;
  const data = await shopifyQuery(query, { id: cartId });
  return formatCart(data.cart);
}

// 7. Add Lines to Cart
export async function addToCart(cartId, variantId, quantity = 1) {
  const mutation = `
    mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          ${cartFields}
        }
      }
    }
  `;
  const variables = {
    cartId,
    lines: [{ merchandiseId: variantId, quantity }]
  };
  const data = await shopifyQuery(mutation, variables);
  return formatCart(data.cartLinesAdd.cart);
}

// 8. Update Cart Line
export async function updateCartLine(cartId, lineId, quantity) {
  const mutation = `
    mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          ${cartFields}
        }
      }
    }
  `;
  const variables = {
    cartId,
    lines: [{ id: lineId, quantity }]
  };
  const data = await shopifyQuery(mutation, variables);
  return formatCart(data.cartLinesUpdate.cart);
}

// 9. Remove Cart Line
export async function removeFromCart(cartId, lineId) {
  const mutation = `
    mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          ${cartFields}
        }
      }
    }
  `;
  const variables = {
    cartId,
    lineIds: [lineId]
  };
  const data = await shopifyQuery(mutation, variables);
  return formatCart(data.cartLinesRemove.cart);
}

// 10. Customer Sign Up
export async function customerRegister(firstName, lastName, email, password) {
  const mutation = `
    mutation customerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer {
          id
          firstName
          lastName
          email
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;
  const variables = {
    input: { firstName, lastName, email, password }
  };
  const data = await shopifyQuery(mutation, variables);
  const errors = data.customerCreate.customerUserErrors;
  if (errors && errors.length > 0) {
    throw new Error(errors.map(e => e.message).join(', '));
  }
  return data.customerCreate.customer;
}

// 11. Customer Login (Create Access Token)
export async function customerLogin(email, password) {
  const mutation = `
    mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken {
          accessToken
          expiresAt
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;
  const variables = {
    input: { email, password }
  };
  const data = await shopifyQuery(mutation, variables);
  const errors = data.customerAccessTokenCreate.customerUserErrors;
  if (errors && errors.length > 0) {
    throw new Error(errors.map(e => e.message).join(', '));
  }
  return data.customerAccessTokenCreate.customerAccessToken;
}

// 12. Fetch Customer Info & Orders
export async function fetchCustomerData(accessToken) {
  const query = `
    query getCustomerDetails($customerAccessToken: String!) {
      customer(customerAccessToken: $customerAccessToken) {
        firstName
        lastName
        email
        phone
        orders(first: 10) {
          edges {
            node {
              id
              orderNumber
              processedAt
              financialStatus
              fulfillmentStatus
              totalPrice {
                amount
                currencyCode
              }
              lineItems(first: 5) {
                edges {
                  node {
                    title
                    quantity
                    variant {
                      title
                      price {
                        amount
                        currencyCode
                      }
                      image {
                        url
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
  const data = await shopifyQuery(query, { customerAccessToken: accessToken });
  if (!data.customer) return null;
  return {
    ...data.customer,
    orders: data.customer.orders.edges.map(edge => edge.node),
  };
}
