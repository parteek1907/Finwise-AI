"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Users } from 'lucide-react';
import styles from './Landing.module.css';
import { ScrollReveal } from './ScrollAnimations';

export function Community() {
  return (
    <section className={styles.communitySection} id="community">
      <ScrollReveal>
        <div className={styles.communityContainer}>
          <div className={styles.communityContent}>
            <h2 className={styles.communityTitle}>
              Support and Community
            </h2>
            <p className={styles.communityDesc}>
              We build a community for safe, real and supportive financial learning. Our
              community is always helpful in providing information and perspectives, making your
              financial journey easier so you can still manage your finances with confidence.
            </p>
            <Link href="/auth" className={styles.communityButton}>
              <Users size={16} />
              Join Community
            </Link>
          </div>
          <Image
            src="/community.png"
            alt="FinWise AI Community"
            width={600}
            height={400}
            className={styles.communityImage}
          />
        </div>
      </ScrollReveal>
    </section>
  );
}
