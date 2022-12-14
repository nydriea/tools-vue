import { createStore } from 'vuex';
import { ElNotification } from 'element-plus';
import axios from 'axios';
import { loadCSS } from '@/utils';
import Cookies from 'js-cookie';
import dayjs from 'dayjs';

export default createStore({
  state: {
    bodyOffsetWidth: 0,
    isSmallScreen: false,
    leftCollapse: false,
    rightCollapse: false,
    accountCollapse: false,
    fontLoading: false,
    staticURL: '',
    userInfo: {},
    isAdmin: false,
    isMember: false,
    defaultCapacity: 100,
    capacityPrice: 0.02,
    batchExportCardList: [],
  },
  mutations: {
    setBodyOffsetWidth(state) {
      state.bodyOffsetWidth = document.body.offsetWidth;
      state.isSmallScreen = state.bodyOffsetWidth < 800;
    },
    setLeftCollapse(state, value) {
      state.leftCollapse = value;
    },
    setRightCollapse(state, value) {
      state.rightCollapse = value;
    },
    setAccountCollapse(state, value) {
      state.accountCollapse = value;
    },
    setFontLoading(state, value) {
      state.fontLoading = value;
    },
    setStaticURL(state) {
      let prefix = 'v-';
      if (state.isAdmin || state.isMember) {
        prefix = '';
      }
      if (!prefix) {
        ElNotification.success({
          title: '已进入加速模式',
          position: 'bottom-right',
        });
      }
      state.staticURL = `/src/assets/`;
      loadCSS(`/src/assets/css/all.css`);
      loadCSS(`/src/assets/css/ygo-font.css`);
      loadCSS(`/src/assets/css/rd-font.css`);
    },
    setUserInfo(state) {
      try {
        state.userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : {};
      } catch (e) {
        state.userInfo = {};
      }
      const role = state.userInfo.role;
      state.isAdmin = Array.isArray(role) && role.includes('admin');
      const member = state.userInfo.member;
      if (member) {
        const { type, expireDate } = member;
        if (type === 'permanent') {
          state.isMember = true;
        } else {
          state.isMember = dayjs().isBefore(expireDate);
        }
      }
    },
    setBatchExportCardList(state, value) {
      state.batchExportCardList = value;
    },
  },
  actions: {
    getUserInfo({ commit }) {
      return axios({
        method: 'get',
        url: '/profile',
      }).then(res => {
        localStorage.setItem('userInfo', JSON.stringify(res.data));
        commit('setUserInfo');
      });
    },
    removeUserInfo({ commit }) {
      return new Promise(resolve => {
        Cookies.remove('token');
        localStorage.removeItem('userInfo');
        commit('setUserInfo');
        resolve();
      });
    },
  },
});
