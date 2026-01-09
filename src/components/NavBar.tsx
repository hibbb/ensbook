// src/components/NavBar.tsx

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ConnectKitButton } from "connectkit";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faGear,
  faLayerGroup,
  faFeatherPointed,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { SettingsModal } from "./SettingsModal";
import { Tooltip } from "./ui/Tooltip";

export const NavBar = () => {
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { t } = useTranslation();

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `flex items-center gap-2 text-sm font-qs-semibold transition-all py-1 border-b-2 ${
      isActive
        ? "text-link border-link"
        : "text-text-main border-transparent hover:text-link hover:border-link/30"
    }`;
  };

  return (
    <>
      <nav className="relative z-50 flex justify-between items-center mb-5 pb-6 border-b border-table-border">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="text-3xl font-qs-regular transition-colors text-link hover:text-link-hover"
          >
            <span className="text-text-main">ENS</span>Book
          </Link>

          <div className="hidden md:flex gap-6">
            <Link to="/home" className={getLinkClass("/home")}>
              <FontAwesomeIcon icon={faMagnifyingGlass} /> {t("nav.home")}
            </Link>

            <Link to="/mine" className={getLinkClass("/mine")}>
              <FontAwesomeIcon icon={faFeatherPointed} /> {t("nav.mine")}
            </Link>

            <Link
              to="/collection/999"
              className={getLinkClass("/collection/999")}
            >
              {/* 🚀 替换: collection.999.name -> collection.999.name (保持不变) */}
              <FontAwesomeIcon icon={faLayerGroup} /> {t("collection.999.name")}
            </Link>

            <Link
              to="/collection/bip39"
              className={getLinkClass("/collection/bip39")}
            >
              {/* 🚀 替换: collection.bip39.name -> collection.bip39.name (保持不变) */}
              <FontAwesomeIcon icon={faLayerGroup} />{" "}
              {t("collection.bip39.name")}
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Tooltip content={t("nav.settings")}>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm text-link hover:text-link-hover hover:bg-gray-100 transition-all active:scale-95 group"
            >
              <FontAwesomeIcon
                icon={faGear}
                size="lg"
                className="group-hover:rotate-90 transition-transform duration-500"
              />
            </button>
          </Tooltip>
          <ConnectKitButton />
        </div>
      </nav>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
};
