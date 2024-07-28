//
//  HomeView.swift
//  I
//
//  Created by Wilson.Shakya on 27/07/24.
//

import SwiftUI
import SwiftData

struct HomeView: View {
	@EnvironmentObject var navigationModel: NavigationModel

	let featureList: [FeatureType] = [.gallery, .notes, .finance, .password, .links]

	var body: some View {
		NavigationStack(path: $navigationModel.featurePath)  {
			VStack {
				VStack {
					VStack(spacing: 20) {
						HStack {
							Text("Hello User")
							Spacer()
							NavigationLink(destination: GalleryView()) {
								Text("User Image")
							}
						}
						VStack {
							HStack {
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
							.frame(width:  (UIScreen.main.bounds.width - 100))
							.padding(.horizontal, 20)
							.padding(.vertical, 10)
						}
						.background(AppColor.backgroundWhite)
						.clipShape(RoundedRectangle(cornerRadius: 15))
						.shadow(color: AppColor.borderGrey, radius: 10, x: 0, y: 5)

						let columns = [
							GridItem(.flexible()),
							GridItem(.flexible())
						]

						ScrollView {
							LazyVGrid(columns: columns, spacing: 16) {
								ForEach(featureList, id: \.self) { item in
									NavigationLink(value: item) {
										FeatureOptionView(type: item)
									}
								}
							}
						}.scrollIndicators(.hidden)
					}
					Spacer()
				}
				.padding(.top, 20)
				.padding(.leading, 20)
				.padding(.trailing, 20)

			}.background(AppColor.backgroundGrey)
				.navigationDestination(for: FeatureType.self) { view in
					navigationView(for: view)
				}
		}
	}

	private func navigationView(for feature: FeatureType) -> some View {
		switch feature {
			case FeatureType.gallery:
				return AnyView(GalleryView())
			case FeatureType.notes:
				return AnyView(NotesView())
			case FeatureType.finance:
				return AnyView(FinanceView())
			case FeatureType.password:
				return AnyView(PasswordView())
			case FeatureType.links:
				return AnyView(LinksView())
		}
	}

}

//#Preview {
//	HomeView()
//}
