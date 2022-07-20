import axios from 'axios';
import router from '../router.js';

const notLoginView = `
  <button class="open--signForm signIn--open">로그인</button>
  <button class="open--signForm signUp--open">회원가입</button>
`;

const loginView = `
  <button class="btn--logOut">로그아웃</button>
  <a href="/mydrawings">
    <i class="fas fa-solid fa-images"></i>
    내 그림
  </a>
  <a href="/ranking">
    <i class="fas fa-solid fa-trophy"></i>
    랭킹
  </a>
  <a href="/draw">
    <i class="fas fa-paint-brush"></i>
    그림 그리기
  </a>
`;

const signInForm = `
  <button class="close--modal">닫기</button>
  <form method="post" class="signInForm" >
    <div>
      <label for="userId">아이디</label>
      <input type="text" id="userId" name="userId" placeholder="아이디" required />
    </div>
    <div>
      <label for="password">비밀번호</label>
      <input type="password" id="password" name="password" placeholder="비밀번호" required />
    </div>
    <button type="submit">로그인</button>
  </form>
`;

const signUpForm = `
  <button class="close--modal">닫기</button>
  <form method="post" class="signUpForm" enctype="multipart/form-data">
    <div>
      <label for="userId">아이디</label>
      <input type="text" id="userId" class="check--input" name="userId" placeholder="아이디" required autocomplete="on"/>
      <span class="id--informText"></span>
    </div>
    <div>
      <label for="password">비밀번호</label>
      <input type="password" id="password"  class="check--input" name="password" placeholder="비밀번호" required autocomplete="on"/>
      <span class="pwd--informText"></span>
    </div>
    <div>
      <label for="nickName">닉네임</label>
      <input type="text" id="nickName" name="nickName" placeholder="닉네임" required autocomplete="on"/>
    </div>
    <div class="upload-box">
    <label for="userImage">이곳을 클릭하거나 이미지를 드래그 하세요</label>
      <input type="file" id="userImage" name="profile" required value="" accept="image/png, image/gif, image/jpeg, image/jpg"/>
      <img src="" alt="" class="showImage"/>
    </div>
    <button type="submit">회원가입</button>
  </form>
`;

export default () => ({
  async getData() {
    try {
      const res = await axios.get('http://localhost:8000/auth', {
        withCredentials: true
      });
      return res;
    } catch (error) {
      return error.response;
    }
  },

  getHtml({ userId }) {
    console.log(userId);
    return `
          <h1 class="logo">
            <img src="img/title.svg" alt="" />
          </h1>
          <main class="main">
            <div class="top--section">
              <div class="left--section">
                <img src="img/art1.svg" alt="" />
              </div>
              <div class="right--section">
                <img src="img/art2.svg" alt="" />
              </div>
            </div>
            <div class="bottom--section">
              ${userId ? loginView : notLoginView}
            </div>
          </main>
          <div class="form--wrap"></div>
        `;
  },

  eventBinding() {
    const $body = document.querySelector('body');
    const $buttonWrap = document.querySelector('.bottom--section');
    const $formWrap = document.querySelector('.form--wrap');
    let doingNow = null;

    const userSignUp = {
      isValidId: false,
      isValidPwd: false
    };

    const toggleModal = () => {
      doingNow = null;
      $body.classList.toggle('open--modal');
      $formWrap.innerHTML = '';
    };

    const renderForm = () => {
      $formWrap.innerHTML = doingNow === 'signUp' ? signUpForm : signInForm;
    };

    const sendUserReq = async formData => {
      const res = await axios.post(`http://localhost:8000/auth/${doingNow}`, formData, {
        withCredentials: true
      });
      return res;
    };

    const routingIndex = () => {
      router(document.getElementById('root'), '/');
    };

    const signIn = async formElement => {
      try {
        const formData = [...new FormData(formElement)].reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});
        await sendUserReq(formData);
        toggleModal();
        routingIndex();
      } catch (error) {
        console.error(error);
        alert('아이디 혹은 비밀번호가 일치하지 않습니다!');
      }
    };

    const signUp = async formElement => {
      try {
        if (!userSignUp.isValidId) {
          alert('아이디를 확인해 주세요!');
          return;
        }
        if (!userSignUp.isValidPwd) {
          alert('비밀번호를 확인해 주세요!');
          return;
        }
        const formData = new FormData(formElement);
        await sendUserReq(formData);
        toggleModal();
        routingIndex();
      } catch (error) {
        console.error(error);
        alert('회원가입을 실패했습니다.');
      }
    };

    const checkIdRxp = (() => {
      const regExp = /^[a-z0-9]{5,19}$/g;
      return checkingId => regExp.test(checkingId);
    })();

    const checkValidId = checkingId => {
      const idInformText = document.querySelector('.id--informText');

      if (!checkIdRxp(checkingId)) {
        idInformText.innerText = '영문자, 숫자로 6~20자로 조합해주세요';
        idInformText.classList.remove('valid');
        return;
      }

      let checkIdRequest = null;
      if (checkIdRequest) clearTimeout(checkIdRequest);

      checkIdRequest = setTimeout(async () => {
        let resultCheckid = null;

        try {
          resultCheckid = await axios.post(`/auth/checkId`, { checkingId }, { withCredentials: true });
        } catch (error) {
          console.error(error);
        } finally {
          resultCheckid = !!resultCheckid;
          idInformText.innerText = resultCheckid ? '사용 가능한 아이디 입니다.' : '중복된 아이디 입니다.';
          userSignUp.isValidId = resultCheckid;
          idInformText.classList.toggle('valid', resultCheckid);
        }
      }, 500);
    };

    const checkValidPwd = (() => {
      const regExp = /^(?=.*[a-zA-z])(?=.*[0-9])(?=.*[$`~!@$!%*#^?&\\(\\)\-_=+]).{8,16}$/;

      return checkingPwd => {
        const pwdInformText = document.querySelector('.pwd--informText');
        const resultPassTest = regExp.test(checkingPwd);

        userSignUp.isValidPwd = resultPassTest;
        pwdInformText.innerText = resultPassTest
          ? '사용 가능한 패스워드입니다.'
          : '8 ~ 16자 영문, 숫자, 특수문자를 최소 한가지씩 조합해주세요.';
        pwdInformText.classList.toggle('valid', resultPassTest);
      };
    })();

    const showUploadImage = input => {
      if (!input.files[0]) return;

      const reader = new FileReader();

      reader.readAsDataURL(input.files[0]);
      reader.addEventListener('load', ({ target }) => {
        const showImage = document.querySelector('.showImage');
        showImage.setAttribute('src', target.result);
        showImage.classList.add('show');
      });
    };

    const logOut = async () => {
      try {
        await axios.post('http://localhost:8000/auth/logOut', null, {
          withCredentials: true
        });
        routingIndex();
      } catch (error) {
        console.error(error);
      }
    };

    $body.addEventListener('click', ({ target }) => {
      if (!target.matches('.open--modal')) return;
      toggleModal();
    });

    $buttonWrap.addEventListener('click', ({ target }) => {
      if (!target.matches('button')) return;

      if (target.matches('.btn--logOut')) {
        logOut();
      } else {
        toggleModal();
        doingNow = target.matches('.signIn--open') ? 'signIn' : 'signUp';
        renderForm();
      }
    });

    $formWrap.addEventListener('keyup', ({ target }) => {
      if (doingNow !== 'signUp' || !target.matches('.check--input')) return;
      target.matches('#userId') ? checkValidId(target.value) : checkValidPwd(target.value);
    });

    $formWrap.addEventListener('submit', e => {
      e.preventDefault();
      if (!doingNow) return;
      doingNow === 'signIn' ? signIn(e.target) : signUp(e.target);
    });

    $formWrap.addEventListener('click', ({ target }) => {
      if (!target.matches('.close--modal')) return;
      toggleModal();
    });

    $formWrap.addEventListener('change', ({ target }) => {
      if (!target.matches('#userImage')) return;
      showUploadImage(target);
    });
  }
});
