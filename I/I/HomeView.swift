//
//  HomeView.swift
//  I
//
//  Created by Wilson.Shakya on 27/07/24.
//

import SwiftUI
import SwiftData

struct HomeView: View {

	var body: some View {
		VStack {
			VStack {
				VStack(spacing: 20) {
					HStack {
						Text("Hello User")
						Spacer()
						NavigationLink(destination: GalleryView()) {
							Text("Hello User")
						}

					}
					HStack {
						VStack {
							HStack {
								HStack {
									Text("weather Image")
									VStack {
										Text("weather text")
										Text("weather value")
									}
								}
							}

							HStack {
								HStack {
									Text("Time Image")
									VStack {
										Text("Time text")
										Text("Time value")
									}
								}
							}
						}
						.padding(10)

					}
					.background(AppColor.backgroundWhite)

				}

				VStack() {
					VStack(spacing: 50) {
						VStack(spacing: 100) {
							HStack(spacing: 50) {
								NavigationLink(destination: GalleryView()) {
									FeatureOptionView(type: .gallery)
								}
								NavigationLink(destination: FinanceView()) {
									FeatureOptionView(type: .finance)
								}

							}

							HStack(spacing: 50) {
								NavigationLink(destination: NotesView()) {
									FeatureOptionView(type: .notes)
								}
								NavigationLink(destination: PasswordView()) {
									FeatureOptionView(type: .password)
								}
							}
						}
					}.frame(maxWidth: .infinity, maxHeight: .infinity)

				}
			}
			.padding(.top, 20)
			.padding(.leading, 20)
			.padding(.trailing, 20)

		}.background(AppColor.backgroundGrey)

	}

}

#Preview {
	HomeView()
}
