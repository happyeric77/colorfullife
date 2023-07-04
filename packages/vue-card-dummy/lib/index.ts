import DummyCard from "./components/DummyCard.vue";

export default {
  install: (app) => {
    app.component("DummyCard", DummyCard);
  },
};
