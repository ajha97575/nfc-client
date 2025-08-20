// "use client"

// import { createContext, useContext, useReducer, useEffect } from "react"

// const CartContext = createContext()

// const cartReducer = (state, action) => {
//   switch (action.type) {
//     case "ADD_ITEM":
//       const existingItem = state.items.find((item) => item.id === action.payload.id)
//       if (existingItem) {
//         // If item already exists, just increase quantity by 1
//         return {
//           ...state,
//           items: state.items.map((item) =>
//             item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item,
//           ),
//         }
//       }
//       // If new item, add with quantity 1
//       return {
//         ...state,
//         items: [...state.items, { ...action.payload, quantity: 1 }],
//       }

//     case "ADD_ITEM_ONCE":
//       const existingItemOnce = state.items.find((item) => item.id === action.payload.id)
//       if (existingItemOnce) {
//         // If item already exists, don't add again - just return current state
//         return state
//       }
//       // If new item, add with quantity 1
//       return {
//         ...state,
//         items: [...state.items, { ...action.payload, quantity: 1 }],
//       }

//     case "REMOVE_ITEM":
//       return {
//         ...state,
//         items: state.items.filter((item) => item.id !== action.payload),
//       }

//     case "UPDATE_QUANTITY":
//       return {
//         ...state,
//         items: state.items
//           .map((item) =>
//             item.id === action.payload.id ? { ...item, quantity: Math.max(0, action.payload.quantity) } : item,
//           )
//           .filter((item) => item.quantity > 0),
//       }

//     case "CLEAR_CART":
//       return {
//         ...state,
//         items: [],
//       }

//     case "LOAD_CART":
//       return {
//         ...state,
//         items: action.payload || [],
//       }

//     default:
//       return state
//   }
// }

// export const CartProvider = ({ children }) => {
//   const [state, dispatch] = useReducer(cartReducer, { items: [] })

//   // Load cart from localStorage on mount
//   useEffect(() => {
//     try {
//       const savedCart = localStorage.getItem("qr-scanner-cart")
//       if (savedCart) {
//         const parsedCart = JSON.parse(savedCart)
//         if (Array.isArray(parsedCart) && parsedCart.length > 0) {
//           dispatch({ type: "LOAD_CART", payload: parsedCart })
//           console.log("✅ Cart loaded from localStorage:", parsedCart.length, "items")
//         }
//       }
//     } catch (error) {
//       console.error("Error loading cart from localStorage:", error)
//       // Clear corrupted data
//       localStorage.removeItem("qr-scanner-cart")
//     }
//   }, [])

//   // Save cart to localStorage whenever it changes
//   useEffect(() => {
//     try {
//       localStorage.setItem("qr-scanner-cart", JSON.stringify(state.items))
//       console.log("💾 Cart saved to localStorage:", state.items.length, "items")
//     } catch (error) {
//       console.error("Error saving cart to localStorage:", error)
//     }
//   }, [state.items])

//   const addItem = (item) => {
//     dispatch({ type: "ADD_ITEM", payload: item })
//   }

//   const addItemOnce = (item) => {
//     dispatch({ type: "ADD_ITEM_ONCE", payload: item })
//   }

//   const removeItem = (id) => {
//     dispatch({ type: "REMOVE_ITEM", payload: id })
//   }

//   const updateQuantity = (id, quantity) => {
//     dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
//   }

//   const clearCart = () => {
//     dispatch({ type: "CLEAR_CART" })
//     // Also clear from localStorage
//     localStorage.removeItem("qr-scanner-cart")
//     console.log("🗑️ Cart cleared completely")
//   }

//   const getTotal = () => {
//     return state.items.reduce((total, item) => total + 1 * item.quantity, 0) // ₹1 per item
//   }

//   const getItemCount = () => {
//     return state.items.reduce((count, item) => count + item.quantity, 0)
//   }

//   const isItemInCart = (itemId) => {
//     return state.items.some((item) => item.id === itemId)
//   }

//   return (
//     <CartContext.Provider
//       value={{
//         items: state.items,
//         addItem,
//         addItemOnce,
//         removeItem,
//         updateQuantity,
//         clearCart,
//         getTotal,
//         getItemCount,
//         isItemInCart,
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   )
// }

// export const useCart = () => {
//   const context = useContext(CartContext)
//   if (!context) {
//     throw new Error("useCart must be used within a CartProvider")
//   }
//   return context
// }




"use client"

import { createContext, useContext, useReducer, useEffect } from "react"

const CartContext = createContext()

const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_ITEM":
      const existingItem = state.items.find((item) => item.id === action.payload.id)
      if (existingItem) {
        // If item already exists, just increase quantity by 1
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item,
          ),
        }
      }
      // If new item, add with quantity 1
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
      }

    case "ADD_ITEM_ONCE":
      const existingItemOnce = state.items.find((item) => item.id === action.payload.id)
      if (existingItemOnce) {
        // If item already exists, don't add again - just return current state
        return state
      }
      // If new item, add with quantity 1
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
      }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      }

    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items
          .map((item) =>
            item.id === action.payload.id ? { ...item, quantity: Math.max(0, action.payload.quantity) } : item,
          )
          .filter((item) => item.quantity > 0),
      }

    case "CLEAR_CART":
      return {
        ...state,
        items: [],
      }

    case "LOAD_CART":
      return {
        ...state,
        items: action.payload || [],
      }

    default:
      return state
  }
}

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("qr-scanner-cart")
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)
        if (Array.isArray(parsedCart) && parsedCart.length > 0) {
          dispatch({ type: "LOAD_CART", payload: parsedCart })
          console.log("✅ Cart loaded from localStorage:", parsedCart.length, "items")
        }
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error)
      // Clear corrupted data
      localStorage.removeItem("qr-scanner-cart")
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("qr-scanner-cart", JSON.stringify(state.items))
      console.log("💾 Cart saved to localStorage:", state.items.length, "items")
    } catch (error) {
      console.error("Error saving cart to localStorage:", error)
    }
  }, [state.items])

  const addItem = (item) => {
    dispatch({ type: "ADD_ITEM", payload: item })
  }

  const addItemOnce = (item) => {
    dispatch({ type: "ADD_ITEM_ONCE", payload: item })
  }

  const removeItem = (id) => {
    dispatch({ type: "REMOVE_ITEM", payload: id })
  }

  const updateQuantity = (id, quantity) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
    // Also clear from localStorage
    localStorage.removeItem("qr-scanner-cart")
    console.log("🗑️ Cart cleared completely")
  }

  const getTotal = () => {
    return state.items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getItemCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0)
  }

  const isItemInCart = (itemId) => {
    return state.items.some((item) => item.id === itemId)
  }

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addItem,
        addItemOnce,
        removeItem,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
        isItemInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
