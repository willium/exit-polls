const config = {
  defaultFilter: {states: [], candidates: [], answers: []},
  chart: {
    node: {
      width: 50,
      padding: 40,
      margin: 10
    },
    iterations: 32,
    width: 960,
    height: 620,
    margin: {
      top: 20,
      bottom: 20,
      left: 150,
      right: 150
    }
  },
  data: {
    currentCandidates: [
      61815, // cruz
      36679, // kasich
      8639, // trump
      1746, // clinton
      1445 // sanders
    ],
  }
};

export default config;