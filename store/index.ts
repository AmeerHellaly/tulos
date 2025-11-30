// store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";
import cartReducer from "./cartSlice"; // عدّل حسب مسارك

// مفتاح ديناميكي حسب المستخدم
const getPersistKey = () => {
  if (typeof window === "undefined") return "guest-cart";
  const email = localStorage.getItem("email");
  return email ? `cart-${email}` : "guest-cart";
};

const persistConfig = {
  key: getPersistKey(),
  storage,
  whitelist: ["cart"],
};

const rootReducer = combineReducers({
  cart: cartReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
