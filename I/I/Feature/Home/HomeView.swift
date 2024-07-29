//
//  HomeView.swift
//  I
//
//  Created by Wilson.Shakya on 27/07/24.
//

import SwiftUI
import SwiftData

struct HomeView: View {
	@EnvironmentObject var navigationManager: NavigationManager

	let featureList: [FeatureType] = [.gallery, .notes, .finance, .password, .links]

	var body: some View {
		NavigationStack(path: $navigationManager.path)  {
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




struct ScreenA: View {
	@EnvironmentObject var navigationManager: NavigationManager

	var body: some View {
		NavigationStack(path: $navigationManager.path) {
			VStack {
				Text("This is Screen A")
				Button("Go to Screen B") {
					navigationManager.path.append(ScreenIdentifier.screenB)
				}
			}
			.navigationDestination(for: ScreenIdentifier.self) { screen in
				switch screen {
					case .screenB:
						ScreenB()
					default:
						EmptyView()
				}
			}
			.navigationTitle("Screen A")
		}
	}
}

enum ScreenIdentifier: Hashable {
	case screenA
	case screenB
	case screenC
}


struct ScreenB: View {
	@EnvironmentObject var navigationManager: NavigationManager

	var body: some View {
		VStack {
			Text("This is Screen B")
			Button("Go to Screen C") {
				navigationManager.path.append(ScreenIdentifier.screenC)
			}
		}
		.navigationDestination(for: ScreenIdentifier.self) { screen in
			switch screen {
				case .screenC:
					ScreenC()
				default:
					EmptyView()
			}
		}
		.navigationTitle("Screen B")
	}
}


struct ScreenC: View {
	var body: some View {
		Text("This is Screen C")
			.navigationTitle("Screen C")
	}
}
