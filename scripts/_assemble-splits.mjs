import fs from 'fs';
import path from 'path';

const root = process.cwd();

function readLines(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n').split('\n');
}

function write(rel, text) {
  fs.writeFileSync(path.join(root, rel), text.endsWith('\n') ? text : `${text}\n`, 'utf8');
  console.log(rel, text.trimEnd().split('\n').length);
}

function slice(lines, start, end) {
  return lines.slice(start - 1, end).join('\n');
}

const card = readLines('components/apartments/ApartmentCard.tsx');

const apartmentCard = `'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { ApartmentCardChrome } from './ApartmentCardChrome';
import { ApartmentDealSection } from './ApartmentDealSection';
import { ApartmentLinksSection } from './ApartmentLinksSection';
import { ApartmentOverviewSection } from './ApartmentOverviewSection';
import { ApartmentPreviewModal } from './ApartmentPreviewModal';
import { buildApartmentUpdateInput, type Apartment } from './apartmentCardModel';

interface ApartmentCardProps {
  apartmentId: number;
}

${slice(card, 96, 154)}
      const apiData = buildApartmentUpdateInput(formData);
${slice(card, 275, 363)}

${slice(card, 394, 407)}

${slice(card, 424, 448)}
      <ApartmentCardChrome
        apartment={apartment}
        editing={editing}
        setFormData={setFormData}
        handleCopyLandingLink={handleCopyLandingLink}
        landingCopied={landingCopied}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setEditing={setEditing}
        handleSave={handleSave}
        handleStatusChange={handleStatusChange}
      />

${slice(card, 549, 551)}
          <ApartmentOverviewSection
            apartment={apartment}
            editing={editing}
            formData={formData}
            setFormData={setFormData}
          />
          <ApartmentDealSection
            apartment={apartment}
            editing={editing}
            formData={formData}
            setFormData={setFormData}
            apartmentId={apartmentId}
            refreshAfterUpload={refreshAfterUpload}
          />
${slice(card, 1028, 1033)}
          <ApartmentLinksSection
            apartment={apartment}
            editing={editing}
            formData={formData}
            setFormData={setFormData}
            apartmentId={apartmentId}
            refreshAfterUpload={refreshAfterUpload}
            setPreviewUrl={setPreviewUrl}
            setPreviewOriginalUrl={setPreviewOriginalUrl}
          />
${slice(card, 1188, 1190)}
      <ApartmentPreviewModal
        previewUrl={previewUrl}
        setPreviewUrl={setPreviewUrl}
        previewOriginalUrl={previewOriginalUrl}
        setPreviewOriginalUrl={setPreviewOriginalUrl}
      />
${slice(card, 1245, 1247)}
`;

write('components/apartments/ApartmentCard.tsx', apartmentCard);
