import { NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import FormInput from '../../components/common/FormInput';
import Button from '../../components/common/Button';
import { emailduplicate, nicknameduplicate, signup } from '../../api/auth';
import { createWallet } from '../../api/wallet';
import { requestEth } from '../../api/wallet';
import Link from 'next/link';
import Web3 from 'web3';
import { useRecoilState } from 'recoil';
import { userState } from '../../store/states';
import { normalize } from 'path';
import Title from '../../components/common/Title';
import Crypto from 'crypto-js';

async function createUser(
  email: string,
  password: string,
  name: string,
  nickname: string
): Promise<any> {
  const response = await signup({ email, password, name, nickname });
}

const Signup: NextPage = ({}) => {
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const passwordCkInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const nicknameInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  const [user, setUserstate] = useRecoilState(userState);
  const [isEmailError, setIsEmailError] = useState(false);
  const [isEmailDpError, setIsEmailDpError] = useState(true);
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [isPasswordCkError, setIsPasswordCkError] = useState(false);
  const [isNameError, setIsNameError] = useState(false);
  const [isNicknameError, setIsNicknameError] = useState(false);
  const [isNicknameDpError, setIsNicknameDpError] = useState(true);

  async function submitHandler(event: React.SyntheticEvent) {
    event.preventDefault();
    const enteredEmail = emailInputRef.current?.value || '';
    const enteredPassword = passwordInputRef.current?.value || '';
    const enteredPasswordCk = passwordCkInputRef.current?.value || '';
    const enteredName = nameInputRef.current?.value || '';
    const enteredNickname = nicknameInputRef.current?.value || '';

    if (isEmailError || enteredEmail.trim() === '') {
      alert('????????? ????????? ???????????? ??????????????????.');
      if (emailInputRef.current) emailInputRef.current.focus();
      return;
    }
    if (isEmailDpError) {
      alert('????????? ?????? ????????? ??????????????????.');
      if (emailInputRef.current) emailInputRef.current.focus();
      return;
    }
    if (isPasswordError || enteredPassword.trim() === '') {
      alert('????????? ????????? ??????????????? ??????????????????.');
      return;
    }
    if (isPasswordCkError || enteredPasswordCk.trim() === '') {
      alert('??????????????? ?????? ??????????????????.');
      return;
    }
    if (isNameError || enteredName.trim() === '') {
      alert('????????? ????????? ????????? ??????????????????.');
      return;
    }
    if (isNicknameError || enteredNickname.trim() === '') {
      alert('????????? ????????? ???????????? ??????????????????.');
      return;
    }
    if (isNicknameDpError) {
      alert('????????? ?????? ????????? ??????????????????.');
      return;
    }
    try {
      const response = await createUser(
        enteredEmail,
        enteredPassword,
        enteredName,
        enteredNickname
      );

      const web3 = new Web3(
        new Web3.providers.HttpProvider(
          process.env.NEXT_PUBLIC_BLOCKCHAIN_URI || ''
        )
      );
      const account = await web3.eth.accounts.create();
      const res = await web3.eth.accounts.privateKeyToAccount(
        account.privateKey
      );
      const AESprivateKey = 'JUpViFIyRMB4NsMvwEFlmowYLa6N9UCb';
      const encryptedPrivateKey = Crypto.AES.encrypt(
        account.privateKey,
        AESprivateKey
      ).toString();
      await createWallet({
        email: enteredEmail,
        address: res.address,
        privateKey: encryptedPrivateKey,
      });
      requestEth(res.address);
      router.push('/auth/login');
    } catch (error) {
      alert('?????? ??????????????????.');
    }
  }

  async function checkHandler(
    event: React.ChangeEvent<HTMLInputElement>,
    select: string
  ) {
    event.preventDefault();
    const enteredEmail = emailInputRef.current?.value || '';
    const enteredPassword = passwordInputRef.current?.value || '';
    const enteredPasswordCk = passwordCkInputRef.current?.value || '';
    const enteredName = nameInputRef.current?.value || '';
    const enteredNickname = nicknameInputRef.current?.value || '';

    switch (select) {
      case 'email':
        setIsEmailDpError(true);
        if (
          /^[A-Za-z0-9.\-_]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,6}$/.test(
            enteredEmail
          )
        ) {
          setIsEmailError(false);
        } else {
          setIsEmailError(true);
        }
        break;
      case 'password':
        if (
          /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,}$/.test(
            enteredPassword
          )
        ) {
          setIsPasswordError(false);
        } else {
          setIsPasswordError(true);
        }
        break;
      case 'passwordCk':
        if (enteredPassword === enteredPasswordCk) {
          setIsPasswordCkError(false);
        } else {
          setIsPasswordCkError(true);
        }
        break;
      case 'name':
        if (/^[???-???|???-???|???-???]{2,}$/.test(enteredName)) {
          setIsNameError(false);
        } else {
          setIsNameError(true);
        }
        break;
      case 'nickname':
        setIsNicknameDpError(true);
        if (/^[a-zA-Z???-???0-9-_.]{2,8}$/.test(enteredNickname)) {
          setIsNicknameError(false);
        } else {
          setIsNicknameError(true);
        }
        break;
    }
  }

  async function emailDpHandler(event: React.MouseEvent) {
    const enteredEmail = emailInputRef.current?.value || '';
    event.preventDefault();
    if (isEmailError) {
      alert('????????? ???????????? ?????? ??????????????????.');
      return;
    }
    const response = await emailduplicate({ email: enteredEmail });
    if (response.data) {
      setIsEmailDpError(false);
      alert('?????? ????????? ??????????????????.');
    } else {
      setIsEmailDpError(true);
      alert('?????? ????????? ??????????????????.');
    }
  }

  async function nicknameDpHandler(event: React.MouseEvent) {
    const enteredNickname = nicknameInputRef.current?.value || '';
    event.preventDefault();
    if (isNameError) {
      alert('????????? ???????????? ?????? ??????????????????.');
      return;
    }
    const response = await nicknameduplicate({ nickname: enteredNickname });
    if (response.data) {
      setIsNicknameDpError(false);
      alert('?????? ????????? ??????????????????.');
    } else {
      setIsNicknameDpError(true);
      alert('???????????? ??????????????????.');
    }
  }

  return (
    <>
      <Head>
        <title>????????????</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/images/logo.png" />
      </Head>
      <main>
        <Title>????????????</Title>
        <form
          onSubmit={submitHandler}
          className="flex flex-col justify-center items-center"
        >
          <div className="flex flex-row">
            <FormInput
              label="?????????"
              id="email"
              isError={isEmailError}
              errMsg="* ????????? ????????? ???????????? ??????????????????."
              onChange={(e) => checkHandler(e, 'email')}
              ref={emailInputRef}
            ></FormInput>
            <Button
              label="?????? ??????"
              btnType="normal"
              btnSize="medium"
              customstyle="mt-3"
              type="button"
              onClick={emailDpHandler}
            ></Button>
          </div>
          <div className="flex flex-row  w-fit">
            <FormInput
              label="????????????"
              id="password"
              type="password"
              isError={isPasswordError}
              errMsg="* ?????????, ??????, ???????????? ?????? 8?????? ??????"
              onChange={(e) => checkHandler(e, 'password')}
              ref={passwordInputRef}
            ></FormInput>
            <div className="w-24 h-10 m-2"></div>
          </div>
          <div className="flex flex-row">
            <FormInput
              label="???????????? ??????"
              id="passwordCk"
              type="password"
              isError={isPasswordCkError}
              errMsg="* ??????????????? ?????? ??????????????????."
              onChange={(e) => checkHandler(e, 'passwordCk')}
              ref={passwordCkInputRef}
            ></FormInput>
            <div className="w-24 h-10 m-2"></div>
          </div>
          <div className="flex flex-row">
            <FormInput
              label="??????"
              id="name"
              isError={isNameError}
              errMsg="* 2?????? ????????? ????????? ??????????????????."
              onChange={(e) => checkHandler(e, 'name')}
              ref={nameInputRef}
            ></FormInput>
            <div className="w-24 h-10 m-2"></div>
          </div>
          <div className="flex flex-row">
            <FormInput
              label="?????????"
              id="nickname"
              isError={isNicknameError}
              errMsg="* 2~8????????? ???????????? ??????????????????."
              onChange={(e) => checkHandler(e, 'nickname')}
              ref={nicknameInputRef}
            ></FormInput>
            <Button
              label="?????? ??????"
              btnType="normal"
              btnSize="medium"
              customstyle="mt-3"
              type="button"
              onClick={nicknameDpHandler}
            ></Button>
          </div>
          <div className="flex justify-center content-center">
            <Link href="/auth/login">
              <Button
                label="??????"
                btnType="normal"
                btnSize="medium"
                type="button"
              ></Button>
            </Link>

            <Button
              label="??????"
              btnType="active"
              btnSize="medium"
              type="submit"
            ></Button>
          </div>
        </form>
      </main>
    </>
  );
};

export default Signup;
