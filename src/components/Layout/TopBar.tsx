
import React from 'react';
import { Bell, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const TopBar = ({ sidebarOpen, setSidebarOpen }) => {
  const { signOut, profile, language, setLanguage } = useAuth();
  const today = new Date();

  return (
    <header className="sticky top-0 z-40 flex w-full bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="z-99999 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark lg:hidden"
          >
            <span className="relative block h-5.5 w-5.5 cursor-pointer">
              <span className="absolute right-0 h-full w-full">
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-[0] duration-200 ease-in-out dark:bg-white ${
                    !sidebarOpen && '!w-full delay-300'
                  }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-150 duration-200 ease-in-out dark:bg-white ${
                    !sidebarOpen && '!w-full delay-400'
                  }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-200 duration-200 ease-in-out dark:bg-white ${
                    !sidebarOpen && '!w-full delay-500'
                  }`}
                ></span>
              </span>
              <span className="absolute right-0 h-full w-full rotate-45">
                <span
                  className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-black delay-300 duration-200 ease-in-out dark:bg-white ${
                    sidebarOpen && '!h-0 !delay-[0]'
                  }`}
                ></span>
                <span
                  className={`delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-black duration-200 ease-in-out dark:bg-white ${
                    sidebarOpen && '!h-0 !delay-200'
                  }`}
                ></span>
              </span>
            </span>
          </button>
        </div>

        {/* User Info */}
        <div className="hidden sm:block">
          <div className="text-lg font-medium">Hi there, {profile?.first_name}</div>
          <p className="text-sm text-gray-500">{format(today, 'EEEE, dd MMMM')}</p>
        </div>

        <div className="flex items-center gap-3 2xsm:gap-7">
          {/* Notification */}
          <div className="relative">
            <button className="flex h-9 w-9 items-center justify-center rounded-full border-[0.5px] border-stroke bg-gray hover:text-primary dark:border-strokedark dark:bg-meta-4 dark:text-white">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-medium text-white">2</span>
            </button>
          </div>
          
          {/* Language */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-9 w-9 items-center justify-center rounded-full border-[0.5px] border-stroke bg-gray hover:text-primary dark:border-strokedark dark:bg-meta-4 dark:text-white">
                <Globe className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="mt-2 w-48 rounded-md border border-stroke bg-white p-0 shadow-default dark:border-strokedark dark:bg-boxdark">
              <DropdownMenuLabel className="px-4 py-2 text-sm font-medium">Select Language</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setLanguage('en')}
                className={`flex cursor-pointer items-center gap-2 px-4 py-2 text-sm hover:bg-primary/5 ${language === 'en' ? 'bg-primary/10' : ''}`}
              >
                <span className="text-lg mr-1">🇺🇸</span>
                English
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setLanguage('no')}
                className={`flex cursor-pointer items-center gap-2 px-4 py-2 text-sm hover:bg-primary/5 ${language === 'no' ? 'bg-primary/10' : ''}`}
              >
                <span className="text-lg mr-1">🇳🇴</span>
                Norwegian
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2">
                <span className="hidden text-right lg:block">
                  <span className="block text-sm font-medium text-black dark:text-white">
                    {profile?.first_name} {profile?.last_name}
                  </span>
                  <span className="block text-xs">{profile?.role}</span>
                </span>
                <div className="h-10 w-10 rounded-full overflow-hidden">
                  <img
                    src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.first_name}+${profile?.last_name}&background=random`}
                    alt={`${profile?.first_name} ${profile?.last_name}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="mt-2 w-56 rounded-md border border-stroke bg-white p-0 shadow-default dark:border-strokedark dark:bg-boxdark">
              <DropdownMenuLabel className="border-b border-stroke px-4 py-3 dark:border-strokedark">
                {profile?.first_name} {profile?.last_name}
                <p className="text-xs text-gray-500 mt-1">{profile?.role}</p>
              </DropdownMenuLabel>
              <DropdownMenuItem 
                onSelect={() => window.location.href = '/profile'}
                className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm hover:bg-primary/5"
              >
                <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18">
                  <path d="M9.00002 7.79065C11.0571 7.79065 12.7305 6.11722 12.7305 4.06017C12.7305 1.99713 11.0571 0.323486 9.00002 0.323486C6.94294 0.323486 5.26953 1.99713 5.26953 4.06017C5.26953 6.11722 6.94294 7.79065 9.00002 7.79065ZM9.00002 1.44722C10.4202 1.44722 11.6068 2.62981 11.6068 4.06017C11.6068 5.48454 10.4202 6.66713 9.00002 6.66713C7.57987 6.66713 6.39319 5.48454 6.39319 4.06017C6.39319 2.62981 7.57987 1.44722 9.00002 1.44722Z"></path>
                  <path d="M9.00002 9.50562C4.89539 9.50562 1.56245 12.8422 1.56245 16.9469V17.5086C1.56245 17.7684 1.77541 17.9813 2.0351 17.9813C2.2948 17.9813 2.50776 17.7684 2.50776 17.5086V16.9469C2.50776 13.364 5.41809 10.4509 9.00002 10.4509C12.582 10.4509 15.4923 13.364 15.4923 16.9469V17.5086C15.4923 17.7684 15.7053 17.9813 15.9649 17.9813C16.2246 17.9813 16.4376 17.7684 16.4376 17.5086V16.9469C16.4376 12.8422 13.1046 9.50562 9.00002 9.50562Z"></path>
                </svg>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem 
                onSelect={() => window.location.href = '/settings'}
                className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm hover:bg-primary/5"
              >
                <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18">
                  <path d="M16.2177 10.1476C16.077 10.0638 15.9942 9.9484 15.946 9.82099C15.9087 9.69723 15.9004 9.54883 15.9363 9.43387C16.5765 7.67949 15.6527 5.71485 13.8983 4.97992L12.4551 4.33567C10.777 3.63602 8.86278 4.5134 8.11784 6.12879L8.0104 6.39877C7.96218 6.51005 7.88576 6.61252 7.78113 6.67931C7.67256 6.74984 7.53976 6.78355 7.42113 6.78355C7.32481 6.78723 7.22848 6.7651 7.15206 6.74246L6.75235 6.6198C6.67593 6.59716 6.59952 6.55713 6.53757 6.51005C6.38683 6.40758 6.27459 6.24813 6.20162 6.08868C6.14519 5.95018 6.13418 5.80178 6.16792 5.65707C6.76623 3.49288 5.63946 1.19953 3.47527 0.583591L1.79722 0.0973937C1.41198 -0.0050218 1.01227 -0.026666 0.631028 0.0367868C0.249783 0.100239 -0.0928238 0.230589 -0.414499 0.434638C-0.71985 0.634358 -0.989232 0.903735 -1.13548 1.20902C-1.28172 1.51432 -1.39397 1.85884 -1.37195 2.18968L-0.812544 7.04573C-0.776483 7.34735 -0.652776 7.62465 -0.461879 7.86301C-0.270981 8.10137 -0.00891334 8.29363 0.257981 8.39979C0.521222 8.5023 0.79428 8.52495 1.05752 8.49862C1.31339 8.47596 1.54805 8.39242 1.75087 8.24771C1.87413 8.14891 1.97413 8.03012 2.04711 7.90635C2.12353 7.78259 2.17995 7.63419 2.17995 7.50675L2.28118 6.83987C2.28486 6.72347 2.31492 6.61364 2.33694 6.49724C2.37067 6.43408 2.40073 6.37827 2.45348 6.32614C2.49089 6.28274 2.53932 6.24834 2.59574 6.22937C2.6596 6.20673 2.72346 6.19513 2.78731 6.19513C2.83638 6.19881 2.88912 6.20673 2.94186 6.22203L4.32189 6.67563C5.35929 7.01647 6.49343 6.72715 7.18207 5.94271C7.28699 5.81895 7.41392 5.71649 7.55728 5.6393C7.70434 5.56877 7.86976 5.52537 8.03518 5.52905C8.20061 5.53273 8.36971 5.58117 8.51309 5.65538C8.65646 5.72959 8.78339 5.84231 8.87972 5.97339C9.57936 6.84478 10.7652 7.22634 11.8578 6.85214L13.289 6.21526C13.4874 6.13275 13.6564 6.01267 13.8087 5.8606C13.961 5.70851 14.0843 5.52906 14.1741 5.32311C14.264 5.12451 14.3204 4.90959 14.3463 4.69467C14.3721 4.47975 14.3572 4.26483 14.303 4.05727C14.205 3.85868 14.0712 3.68659 13.9191 3.54189C13.7671 3.39719 13.587 3.28448 13.3922 3.20934C13.1936 3.13146 12.9839 3.09911 12.774 3.10647C12.5642 3.11751 12.3582 3.17333 12.1744 3.27211L11.0945 3.82372C10.9639 3.89057 10.822 3.9205 10.6749 3.92418C10.5352 3.92786 10.3971 3.89057 10.2702 3.82372C10.1614 3.76423 10.0563 3.67067 9.98335 3.56453C9.91405 3.45471 9.86866 3.33831 9.85501 3.21454L9.71164 1.81187C9.68962 1.58959 9.62576 1.37467 9.52006 1.18785C9.41436 1.00103 9.27099 0.831582 9.09457 0.701231C8.91815 0.574209 8.71221 0.473359 8.4969 0.426062C8.28158 0.378764 8.05059 0.382444 7.83528 0.434741C7.58676 0.493358 7.36412 0.60775 7.17502 0.76718C6.9896 0.91924 6.83518 1.11416 6.73682 1.33645C6.63845 1.55136 6.5883 1.79341 6.59198 2.03913C6.59198 2.27248 6.63845 2.50583 6.74417 2.71339L7.25675 3.7655C7.29417 3.85906 7.29417 3.96152 7.26411 4.05509C7.23404 4.14865 7.17019 4.22379 7.08273 4.27592C6.9896 4.32805 6.8818 4.34702 6.78344 4.33599C6.68141 4.32495 6.59198 4.27592 6.52445 4.2164L5.61275 3.42829C5.46201 3.30452 5.28559 3.20574 5.09649 3.14624C4.90739 3.08674 4.7146 3.06042 4.52182 3.07882C4.3217 3.09727 4.13628 3.15309 3.9656 3.23928C3.79125 3.32916 3.6405 3.45661 3.52458 3.61302C3.40867 3.76944 3.31614 3.95162 3.26977 4.14477C3.22339 4.33054 3.22339 4.52631 3.26977 4.71945C3.31614 4.90891 3.40867 5.09094 3.52458 5.25039L4.88627 7.08568C5.76134 8.25142 7.22315 8.82932 8.61419 8.61808L9.92961 8.40316C10.022 8.39217 10.1144 8.39949 10.1994 8.41846C10.2882 8.44111 10.3683 8.47471 10.4373 8.51813C10.5063 8.56657 10.5678 8.6224 10.6169 8.6966C10.6659 8.7708 10.7002 8.84501 10.7223 8.92384L10.8582 9.55336C10.8803 9.63219 10.8803 9.7147 10.8693 9.79721C10.8546 9.87972 10.8252 9.95393 10.7798 10.0244C10.7344 10.0949 10.6743 10.1507 10.6095 10.1941C10.541 10.2338 10.4651 10.2638 10.3892 10.2711L6.84114 10.7947C6.56325 10.8396 6.29435 10.9384 6.05687 11.0846C5.81568 11.2309 5.60553 11.4201 5.44378 11.6461C5.28204 11.8688 5.16979 12.1259 5.11337 12.3938C5.05695 12.6654 5.05695 12.9369 5.11337 13.2012L5.82402 15.9533C6.07254 16.9056 6.98424 17.5693 8.00263 17.5693H8.21081C9.41436 17.5217 10.3228 16.5844 10.3228 15.381V14.3427C10.3228 13.8926 10.6698 13.5481 11.1567 13.5481H12.7139C13.2009 13.5481 13.5478 13.8889 13.5478 14.3427V15.9733C13.5478 16.3436 13.8322 16.6631 14.2208 16.7439C14.3331 16.7661 14.4454 16.7661 14.5577 16.7439C14.67 16.7254 14.775 16.6888 14.8724 16.6298C14.9697 16.5707 15.0571 16.4973 15.1246 16.4051C15.1921 16.3129 15.2413 16.2095 15.2634 16.0968L16.5124 10.981C16.5382 10.8682 16.5235 10.7481 16.4744 10.6456C16.4254 10.5431 16.3395 10.457 16.2177 10.1476Z"></path>
                </svg>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onSelect={() => signOut()}
                className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm hover:bg-primary/5"
              >
                <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18">
                  <path d="M14.2452 3.58547C13.5622 3.58547 13.0091 4.13867 13.0091 4.82173V8.52197C13.0091 9.20499 13.5622 9.7582 14.2452 9.7582C14.9283 9.7582 15.4814 9.20499 15.4814 8.52197V4.82173C15.4814 4.13867 14.9283 3.58547 14.2452 3.58547Z"></path>
                  <path d="M14.2901 0.97693C12.196 0.97693 10.4276 2.74538 10.4276 4.83937V8.53958C10.4276 9.93871 11.1764 11.1726 12.2892 11.7942L10.7557 16.7179C10.6522 17.0355 10.7355 17.3797 10.9684 17.6126C11.2014 17.8456 11.5456 17.9288 11.8632 17.8254L14.2452 17.0813L16.6273 17.8254C16.7307 17.8588 16.834 17.8754 16.9374 17.8754C17.175 17.8754 17.396 17.7886 17.5221 17.6126C17.755 17.3797 17.8383 17.0355 17.7348 16.7179L16.2012 11.7942C17.3141 11.1726 18.0629 9.93871 18.0629 8.53958V4.83937C18.0629 2.74538 16.2944 0.97693 14.2004 0.97693H14.2901Z"></path>
                  <path d="M4.4841 3.58547C4.81179 3.58547 5.13948 3.70273 5.38395 3.9472C5.87285 4.43608 5.87285 5.20629 5.38395 5.69516L2.81692 8.2622L5.38395 10.8293C5.87285 11.3181 5.87285 12.0883 5.38395 12.5772C4.89504 13.0661 4.12482 13.0661 3.63593 12.5772L0.173729 9.11508C-0.315163 8.62618 -0.315163 7.85597 0.173729 7.36707L3.63593 3.90491C3.8804 3.66046 4.1701 3.58547 4.4841 3.58547Z"></path>
                  <path d="M10.6726 8.53955V4.83934C10.6726 3.04995 11.8353 1.48631 13.4489 1.04828C9.599 0.6434 6.23209 3.69575 6.23209 7.56441C6.23209 8.75595 6.56579 9.86467 7.17642 10.8071L5.60112 15.9155C5.49764 16.233 5.58095 16.5772 5.8139 16.8101C6.04684 17.043 6.39104 17.1264 6.70859 17.0229L9.09064 16.2788L11.4727 17.0229C11.5761 17.0562 11.6795 17.0729 11.7829 17.0729C12.0205 17.0729 12.2415 16.9861 12.3676 16.8101C12.6006 16.5772 12.6839 16.233 12.5804 15.9155L11.0471 10.9914C10.8095 10.2045 10.6726 9.38407 10.6726 8.53955Z"></path>
                </svg>
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
