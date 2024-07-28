//
//  IApp.swift
//  I
//
//  Created by Wilson.Shakya on 27/07/24.
//

import SwiftUI

@main

struct IApp: App {
	@StateObject private var navigationModel = NavigationModel()

	var body: some Scene {
		WindowGroup {
			HomeView()
				.environmentObject(navigationModel)
		}
	}
}


